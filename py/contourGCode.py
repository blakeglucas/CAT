import copy
from gcode import GCodeLine, GCodeObject
import json
from scipy import interpolate
from scipy.spatial import KDTree
import scipy.special
import sys

scipy.special.seterr(all='ignore')

def find_corners(nn1, nn2, nn3, nn4):
    ns = (nn1,nn2,nn3,nn4)
    bl = sorted(sorted(ns, key=lambda x: x[0]), key=lambda x: x[1])[0]
    tl = sorted(sorted(ns, key=lambda x: x[0]), key=lambda x: x[1], reverse=True)[0]
    br = sorted(sorted(ns, key=lambda x: x[0], reverse=True), key=lambda x: x[1])[0]
    tr = sorted(sorted(ns, key=lambda x: x[0], reverse=True), key=lambda x: x[1], reverse=True)[0]
    # sys.stdout.write(json.dumps(bl))
    # sys.stdout.write(json.dumps(tl))
    # sys.stdout.write(json.dumps(br))
    # sys.stdout.write(json.dumps(tr))
    # sys.stdout.flush()
    return bl, tl, br, tr

def contour_gcode(obj: GCodeObject, height_map, target_z_depth: float):
    target_z_depth *= 1 if target_z_depth < 0 else -1
    contoured_obj = copy.deepcopy(obj)
    # FlatCam uses G0 for travel moves, G1 for carving moves
    kd_tree = KDTree(height_map, copy_data=True)

    def get_z_offset(x: float, y: float):
        _, i = kd_tree.query((x, y, 0), 4)
        nn1, nn2, nn3, nn4 = [height_map[j] for j in i.tolist()]
        x1, y1, z1 = nn1; x2, y2, z2 = nn2; x3, y3, z3 = nn3; x4, y4, z4 = nn4
        f = interpolate.interp2d([x1, x2, x3, x4], [y1, y2, y3, y4], [z1, z2, z3, z4])
        result = f(x, y)
        return result[0]

    for line in contoured_obj.gcode_lines:
        if (line.cmd == 'G0' or line.cmd == 'G00') and line.x is None and line.y is None and line.z >= 0:
            # Travel z setting, ignore
            pass
        elif (line.cmd == 'G1' or line.cmd == 'G01') and line.x is None and line.y is None and line.z and line.z < 0:
            ## Dive moves, to reset after travel
            line.z = target_z_depth
        elif (line.cmd == 'G1' or line.cmd == 'G01') and line.x and line.y:
            gx, gy = line.x, line.y
            z_offset = get_z_offset(gx, gy)
            line.z = target_z_depth + z_offset

    # Post-processing
    last_alignment_coords = None
    for line in contoured_obj.gcode_lines:
        if (line.cmd == 'G0' or line.cmd == 'G00') and line.z is None and line.x and line.y:
            last_alignment_coords = (line.x, line.y)
        elif (line.cmd == 'G1' or line.cmd == 'G01') and line.x is None and line.y is None and line.z and line.z <= 0:
            z_offset = 0
            if last_alignment_coords:
                z_offset = get_z_offset(*last_alignment_coords)
                last_alignment_coords = None
            line.z = target_z_depth + z_offset
    return contoured_obj

if __name__ == '__main__':
    data = None

    for line in iter(sys.stdin.readline, ''):
        if line.strip() != '':
            data = json.loads(line)

    gcode: str = data['gCode']
    height_map = data['heightMap']
    min_z_depth = data['targetZdepth']

    gcode_obj = GCodeObject(gcode)

    result = contour_gcode(gcode_obj, height_map, min_z_depth)
    result.write_to_stream(sys.stdout)


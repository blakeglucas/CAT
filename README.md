# CNC Auto-Leveling Tool (CAT)
<img src="https://github.com/blakeglucas/CAT/blob/master/src/assets/icons/CATlogo.png?raw=true" width=200px />

CNC Height Mapping is an external tool to "auto-level" CNC machines that do not come equipped with a height probe. This is particularly useful in the development of printed circuit boards on CNC machines like a Snapmaker.

## Required Materials

- Computer with 2+ USB ports
- CNC machine with serial control capability
- Some microcontroller/FPGA board with U(S)ART capability (I used a knockoff Arduino Mega 2560) and a signal pin with pullup resistor (internal or external)
- Cables with alligator clips and some mechanic to attach them to your UART device

## How it Works

The UART device serves as a "switch." The signal ground of the UART device is attached to the CNC bit via alligator clip, and the copper clad board is connected to the signal pin of the UART device, again via alligator clips. The computer begins moving the CNC bit down the Z axis in 0.1 mm steps. When the grounded CNC bit touches the copper, the signal pin is pulled to ground, which triggers a UART transmission to the computer. When the computer receives this serial packet (which can be anything at the moment), it reads and records the CNC machine's current position. The detection mechanic is repeated in a grid pattern. The software uses all collected positions to create a triangulated surface of the copper clad board. The user's G Code is loaded and the contour is applied as appropriate to each point by adding a Z argument to each G1 (or G01) command, instead of using a single Z stepdown command.

## Disclaimer

I have butchered a fair few CNC bits developing this technique. By using or extrapolating from this software, you agree to indemnify me and hold me harmless for any damage that may happen to you, your CNC equipment, or your workspace. Please use carefully and at your own risk. All software herein is provided without warranty under the MIT license.

## Logo Credits

CAT Logo extrapolated from [anggasaputro on Vecteezy](https://www.vecteezy.com/free-vector/cat-logo).

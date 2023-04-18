import React from 'react';
import { IconButton } from '../IconButton';
import {
  UilAngleUp,
  UilAngleLeft,
  UilAngleRight,
  UilAngleDown,
  UilEstate,
  UilCrosshair,
  UilFocusTarget,
  UilAngleDoubleUp,
  UilAngleDoubleDown,
} from '@iconscout/react-unicons';
import { Button } from '../Button';
import { useDispatch, useSelector } from '../../store/hooks';
import { sendMachineCommand } from '../../store/thunks/MachineControl.thunk';
import { SERIAL_COMMAND } from '../../../shared/marlin';
import { RootState } from '../../store';
import { cncReadySelector } from '../../store/reducers/serial.reducer';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export function MachineController() {
  const homing = useSelector(
    (state: RootState) => state.machineControl.machineControl.homing
  );
  const cncReady = useSelector(cncReadySelector);
  const dispatch = useDispatch();

  const [delta, setDelta] = React.useState(0.1);

  function moveX(modifier = 1) {
    dispatch(
      sendMachineCommand({
        cmd: SERIAL_COMMAND.MOVE_REL,
        params: { x: modifier * delta },
      })
    );
  }

  function moveY(modifier = 1) {
    dispatch(
      sendMachineCommand({
        cmd: SERIAL_COMMAND.MOVE_REL,
        params: { y: modifier * delta },
      })
    );
  }

  function moveZ(modifier = 1) {
    dispatch(
      sendMachineCommand({
        cmd: SERIAL_COMMAND.MOVE_REL,
        params: { z: modifier * delta },
      })
    );
  }

  function goWorkOrigin() {
    dispatch(sendMachineCommand({ cmd: SERIAL_COMMAND.GO_TO_ORIGIN }));
  }

  function setWorkOrigin() {
    dispatch(sendMachineCommand({ cmd: SERIAL_COMMAND.SET_WORK }));
  }

  function goHome() {
    dispatch(sendMachineCommand({ cmd: SERIAL_COMMAND.HOME }));
  }

  return (
    <>
      <div className='flex flex-row items-center justify-center gap-2'>
        <Button
          toggleActive={delta === 0.1}
          onClick={() => setDelta(0.1)}>
          0.1 mm
        </Button>
        <Button
          toggleActive={delta === 1}
          onClick={() => setDelta(1)}>
          1 mm
        </Button>
        <Button
          toggleActive={delta === 10}
          onClick={() => setDelta(10)}>
          10 mm
        </Button>
      </div>
      <div className='grid grid-cols-4 gap-6 my-8'>
        <div className='col-start-2 col-span-1 flex justify-center'>
          <Tippy content={`Move Y backward ${delta} mm`}>
            <IconButton
              className='bg-neutral-900'
              onClick={() => moveY(-1)}
              disabled={homing || !cncReady}>
              <UilAngleUp size={42} />
            </IconButton>
          </Tippy>
        </div>
        <div className='col-start-4 flex justify-center'>
          <Tippy content={`Move up ${delta} mm`}>
            <IconButton
              className='bg-neutral-900'
              onClick={() => moveZ(1)}
              disabled={homing || !cncReady}>
              <UilAngleDoubleUp size={42} />
            </IconButton>
          </Tippy>
        </div>
        <div className='col-start-1 flex justify-center'>
          <Tippy content={`Move left ${delta} mm`}>
            <IconButton
              className='bg-neutral-900'
              onClick={() => moveX(-1)}
              disabled={homing || !cncReady}>
              <UilAngleLeft size={42} />
            </IconButton>
          </Tippy>
        </div>
        <div className='flex justify-center'>
          <Tippy content='Go to work origin'>
            <IconButton
              className='bg-neutral-900'
              onClick={() => goWorkOrigin()}
              disabled={homing || !cncReady}>
              <UilCrosshair size={42} />
            </IconButton>
          </Tippy>
        </div>
        <div className='flex justify-center'>
          <Tippy content={`Move right ${delta} mm`}>
            <IconButton
              className='bg-neutral-900'
              onClick={() => moveX()}
              disabled={homing || !cncReady}>
              <UilAngleRight size={42} />
            </IconButton>
          </Tippy>
        </div>
        <div className='col-start-2 col-span-1 flex justify-center'>
          <Tippy content={`Move Y forward ${delta} mm`}>
            <IconButton
              className='bg-neutral-900'
              onClick={() => moveY(1)}
              disabled={homing || !cncReady}>
              <UilAngleDown size={42} />
            </IconButton>
          </Tippy>
        </div>
        <div className='col-start-4 flex justify-center'>
          <Tippy content={`Move down ${delta} mm`}>
            <IconButton
              className='bg-neutral-900'
              onClick={() => moveZ(-1)}
              disabled={homing || !cncReady}>
              <UilAngleDoubleDown size={42} />
            </IconButton>
          </Tippy>
        </div>
      </div>
      <div className='flex flex-row items-center justify-around'>
        <Tippy content='Set work origin'>
          <IconButton
            className='bg-neutral-900'
            onClick={() => setWorkOrigin()}
            disabled={homing || !cncReady}>
            <UilFocusTarget size={42} />
          </IconButton>
        </Tippy>
        <Tippy content='Go home'>
          <IconButton
            className='bg-neutral-900'
            onClick={() => goHome()}
            disabled={homing || !cncReady}>
            <UilEstate size={42} />
          </IconButton>
        </Tippy>
      </div>
    </>
  );
}

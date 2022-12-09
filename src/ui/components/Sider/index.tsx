import React from 'react';
import { Rnd, RndResizeCallback } from 'react-rnd';
import { Select, SelectOption } from '../Select';
import SiderHandle from './Handle';
import { Input } from '../Input';
import { Button } from '../Button';
import { useDispatch, useSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { serialActions } from '../../store/reducers/serial.reducer';
import * as serialThunks from '../../store/thunks/serial.thunk';
import { UilCheckCircle, UilStopCircle } from '@iconscout/react-unicons';
import { IconButton } from '../IconButton';

interface Props {
  width: number;
  setWidth: (width: number) => void;
}

export function Sider(props: Props) {
  const [
    availablePorts,
    portsLoading,
    cncPort,
    cncBaud,
    cncConnecting,
    cncConnected,
    switchPort,
    switchBaud,
    switchConnecting,
    switchConnected,
  ] = useSelector((state: RootState) => [
    state.serial.availablePorts,
    state.serial.portsLoading,
    state.serial.cncPort,
    state.serial.cncBaud,
    state.serial.cncConnecting,
    state.serial.cncConnected,
    state.serial.switchPort,
    state.serial.switchBaud,
    state.serial.switchConnecting,
    state.serial.switchConnected,
  ]);

  const dispatch = useDispatch();

  const unusedPorts = React.useMemo(
    () => availablePorts.filter((p) => cncPort !== p && switchPort !== p),
    [availablePorts, cncPort, switchPort]
  );

  const onResize: RndResizeCallback = (e, _, elementRef) => {
    e.stopPropagation();
    e.preventDefault();
    props.setWidth(elementRef.offsetWidth);
  };

  function setCncPort(value: SelectOption[]) {
    console.log(value);
    dispatch(serialActions.setCncPort(value[0].label));
  }

  function setCncBaud(event: React.FocusEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    dispatch(serialActions.setCncBaud(Number(target.value)));
  }

  function setSwitchPort(value: SelectOption[]) {
    dispatch(serialActions.setSwitchPort(value[0].label));
  }

  function setSerialBaud(event: React.FocusEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    dispatch(serialActions.setSwitchBaud(Number(target.value)));
  }

  function refreshPorts() {
    dispatch(serialThunks.getSerialPorts());
  }

  function connectCncPort() {
    dispatch(
      serialThunks.manageSerialPort({
        port: cncPort,
        baud: cncBaud,
        portType: 'cnc',
        action: 'connect',
      })
    );
  }

  function disconnectCncPort() {
    dispatch(
      serialThunks.manageSerialPort({
        port: cncPort,
        baud: cncBaud,
        portType: 'cnc',
        action: 'disconnect',
      })
    );
  }

  function connectSwitchPort() {
    dispatch(
      serialThunks.manageSerialPort({
        port: switchPort,
        baud: switchBaud,
        portType: 'switch',
        action: 'connect',
      })
    );
  }

  function disconnectSwitchPort() {
    dispatch(
      serialThunks.manageSerialPort({
        port: switchPort,
        baud: switchBaud,
        portType: 'switch',
        action: 'disconnect',
      })
    );
  }

  return (
    <Rnd
      position={{ x: 0, y: 0 }}
      size={{ width: props.width, height: '100%' }}
      disableDragging
      className='overflow-hidden'
      minWidth={200}
      maxWidth='50%'
      onResize={onResize}
      resizeHandleComponent={{ right: <SiderHandle /> }}
      resizeHandleStyles={{ right: { width: '16px' } }}>
      <div className='w-full h-full flex flex-col bg-neutral-800 pl-4 py-2 pr-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Select
            label='CNC Port'
            values={[{ label: cncPort, value: cncPort }]}
            onChange={setCncPort}
            options={unusedPorts.map((port) => ({
              label: port,
              value: port,
            }))}
            noDataLabel='No Ports Available'
            loading={portsLoading}
            disabled={cncConnected}
          />
          <div className='flex flex-row items-end'>
            <Input
              label='CNC Baud'
              defaultValue={cncBaud}
              onBlur={setCncBaud}
              disabled={cncConnected}
            />
            {cncConnected ? (
              <IconButton
                className='ml-2'
                onClick={disconnectCncPort}
                disabled={cncConnecting}>
                <UilStopCircle
                  size={24}
                  className='text-red-700 m-1'
                />
              </IconButton>
            ) : (
              <IconButton
                className='ml-2'
                onClick={connectCncPort}
                disabled={cncConnecting}>
                <UilCheckCircle
                  className='text-green-500 m-1'
                  size={24}
                />
              </IconButton>
            )}
          </div>

          <Select
            label='Switch Port'
            values={[{ label: switchPort, value: switchPort }]}
            onChange={setSwitchPort}
            options={unusedPorts.map((port) => ({
              label: port,
              value: port,
            }))}
            noDataLabel='No Ports Available'
            loading={portsLoading}
            disabled={switchConnected}
          />
          <div className='flex flex-row items-end'>
            <Input
              label='Switch Baud'
              defaultValue={switchBaud}
              onBlur={setSerialBaud}
              disabled={switchConnected}
            />
            {switchConnected ? (
              <IconButton
                className='ml-2'
                onClick={disconnectSwitchPort}
                disabled={switchConnecting}>
                <UilStopCircle
                  size={24}
                  className='text-red-700 m-1'
                />
              </IconButton>
            ) : (
              <IconButton
                className='ml-2'
                onClick={connectSwitchPort}
                disabled={switchConnecting}>
                <UilCheckCircle
                  className='text-green-500 m-1'
                  size={24}
                />
              </IconButton>
            )}
          </div>

          <div className='col-span-1 md:col-span-2 w-full flex justify-center'>
            <Button
              onClick={refreshPorts}
              disabled={portsLoading || (cncConnected && switchConnected)}>
              Refresh Serial Ports
            </Button>
          </div>
        </div>
      </div>
    </Rnd>
  );
}

import React from 'react';
import { Header } from './components/Header';
import { Sider } from './components/Sider';
import { Content } from './components/Content';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AutoHomePage } from './pages/AutoHome';
import { CalibrationPage } from './pages/Calibration';
import CurrentHeightMapPage from './pages/CurrentHeightMap';
import { RawGCodePage } from './pages/RawGCode';
import { ContouredGCodePage } from './pages/ContouredGCode';
import { useDispatch } from './store/hooks';
import { getSerialPorts } from './store/thunks/serial.thunk'

export default function App() {
  const [siderWidth, setSiderWidth] = React.useState(400);

  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch(getSerialPorts())
  }, [])

  return (
    <>
      <Sider
        width={siderWidth}
        setWidth={setSiderWidth}
      />
      <Content marginLeft={siderWidth}>
        <HashRouter>
          <Header />
          <Routes>
            <Route
              path='/autoHome'
              element={<AutoHomePage />}
            />
            <Route
              path='/calibration'
              element={<CalibrationPage />}
            />
            <Route
              path='/currentHeightMap'
              element={<CurrentHeightMapPage />}
            />
            <Route
              path='/rawGCode'
              element={<RawGCodePage />}
            />
            <Route
              path='/contouredGCode'
              element={<ContouredGCodePage />}
            />
            <Route
              path='*'
              element={
                <Navigate
                  to='/autoHome'
                  replace
                />
              }
            />
          </Routes>
        </HashRouter>
      </Content>
    </>
  );
}

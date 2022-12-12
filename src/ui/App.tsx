import React from 'react';
import { Header } from './components/Header';
import { Sider } from './components/Sider';
import { Content } from './components/Content';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { CalibrationPage } from './pages/Calibration';
import { RawGCodePage } from './pages/RawGCode';
import { ContouredGCodePage } from './pages/ContouredGCode';
import { useDispatch } from './store/hooks';
import MenuThunk from './store/thunks/Menu.thunk';

export default function App() {
  const [siderWidth, setSiderWidth] = React.useState(400);

  const dispatch = useDispatch();

  React.useEffect(() => {
    // register menu handlers
    dispatch(MenuThunk());
  }, []);

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
              path='/calibration'
              element={<CalibrationPage />}
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
                  to='/calibration'
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

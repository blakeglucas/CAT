// eslint-disable-next-line import/no-unresolved
import { Titlebar, Color } from 'custom-electron-titlebar';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let titlebar;

window.addEventListener('DOMContentLoaded', () => {
  titlebar = new Titlebar({
    backgroundColor: Color.fromHex('#262626'),
    //itemBackgroundColor: Color.fromHex("#ffffff"),
    svgColor: Color.WHITE,
    icon: '/assets/icons/CATlogo.png',
    //menuPosition: 'bottom',
    //menu: null // = do not automatically use Menu.applicationMenu
    menuTransparency: 80,
  });

  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

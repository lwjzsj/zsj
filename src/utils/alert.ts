import { createDiscreteApi, lightTheme } from "naive-ui";
const configProviderPropsRef = {
  theme: lightTheme,
};
const { message, notification, dialog, loadingBar } = createDiscreteApi(
  ["message", "dialog", "notification", "loadingBar"],
  {
    configProviderProps: configProviderPropsRef,
  }
);
export { message, notification, dialog, loadingBar };

import {
  useSnackbar as rawUseSnackbar,
  SnackbarOptions,
} from 'react-simple-snackbar';

const infoSnackbarOptions: SnackbarOptions = {
  style: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
};

export function useInfoSnackbar(optionsOverride?: SnackbarOptions) {
  return rawUseSnackbar({ ...infoSnackbarOptions, ...(optionsOverride || {}) });
}

const warningSnackbarOptions: SnackbarOptions = {
  style: {
    backgroundColor: '#ca8a04',
    color: 'white',
  },
};

const successSnackbarOptions: SnackbarOptions = {
  style: {
    backgroundColor: '#15803d',
    color: 'white',
  },
};

export function useSuccessSnackbar(optionsOverride?: SnackbarOptions) {
  return rawUseSnackbar({
    ...successSnackbarOptions,
    ...(optionsOverride || {}),
  });
}

export function useWarningSnackbar(optionsOverride?: SnackbarOptions) {
  return rawUseSnackbar({
    ...warningSnackbarOptions,
    ...(optionsOverride || {}),
  });
}

const errorSnackbarOptions: SnackbarOptions = {
  style: {
    backgroundColor: '#b91c1c',
    color: 'white',
  },
};

export function useErrorSnackbar(optionsOverride?: SnackbarOptions) {
  return rawUseSnackbar({
    ...errorSnackbarOptions,
    ...(optionsOverride || {}),
  });
}

// TODO Overrides
export function useAllSnackbars() {
  return [
    ...useInfoSnackbar(),
    ...useSuccessSnackbar(),
    ...useWarningSnackbar(),
    ...useErrorSnackbar(),
  ];
}

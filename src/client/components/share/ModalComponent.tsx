import * as React from "react";
import { StyleSheet, css } from "aphrodite";
import {ButtonComponent} from "./ButtonComponent";

// ______________________________________________________
//
// @ Types
//
export type ModalType = "success" | "info" | "warning" | "error" | "confirm";

type ModalParams = {
  type?: ModalType;
  title: string | React.ReactNode;
  content?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  width?: string;
  height?: string;
};

export type ShowModal = (modalParams: ModalParams) => void;

// ______________________________________________________
//
// @ Styles
//
const popupKeyframes = {
  "0%": {
    transform: "translateX(-50%) translateY(-50%) scale(0)"
  },
  "40%": {
    transform: "translateX(-50%) translateY(-50%) scale(1.07)"
  },
  "70%": {
    transform: "translateX(-50%) translateY(-50%) scale(0.98)"
  },
  "100%": {
    transform: "translateX(-50%) translateY(-50%) scale(1)"
  }
};

const styles = StyleSheet.create({
  Modal: {
    position: "fixed",
    zIndex: 10,
    backgroundColor: "white",
    boxShadow: "0 0 10px lightgrey",
    borderRadius: "5px",
    padding: "10px",
    width: "90%",
    maxWidth: "480px",
    height: "auto",
    maxHeight: "360px",
    top: "30%",
    left: "50%",
    transform: "translateX(-50%) translateY(-50%)",
    animationName: [popupKeyframes],
    animationDuration: "0.5s"
  },
  overlay: {
    zIndex: 9,
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "120%",
    backgroundColor: "rgba(0, 0, 0, 0.25)"
  },
  header: {
    height: "50px",
    fontWeight: "bold",
    borderBottom: "1px solid lightgrey",
    alignItems: "center",
    display: "flex",
    padding: "0 20px"
  },
  figure: {
    height: "1.2rem",
    margin: "0 10px 0 0",
    opacity: 0.9,
    width: "1.2rem"
  },
  content: {
    padding: "10px 20px"
  },
  footer: {
    padding: "16px",
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    margin: "5px"
  }
});

// ______________________________________________________
//
// @ View
//
export const ModalContext = React.createContext<{ showModal: ShowModal }>({
  showModal: (modalParams: ModalParams) => {}
});

export const ModalProvider: React.FC = props => {
  const [isShow, setIsShow] = React.useState<boolean>(false);

  const defaultParams: ModalParams = {
    type: "info",
    title: "",
    content: "",
    okText: "OK",
    cancelText: "Cancel",
    onOk: () => {},
    onCancel: () => {},
    width: "90%",
    height: "auto"
  };

  const modal = React.useRef<ModalParams>({
    ...defaultParams
  });

  const showModal = (params: ModalParams) => {
    if (isShow) return;
    modal.current = { ...defaultParams, ...params };
    setIsShow(true);
  };

  const onClickOk = React.useCallback(() => {
    modal.current.onOk();
    setIsShow(false);
  }, []);

  const onClickCancel = React.useCallback(() => {
    modal.current.onCancel();
    setIsShow(false);
  }, []);

  return (
    <>
      <ModalContext.Provider value={{ showModal }}>
        {props.children}
      </ModalContext.Provider>
      {isShow && (
        <>
          {/* モーダル本体 */}
          <section
            style={{ width: modal.current.width, height: modal.current.height }}
            className={css(styles.Modal)}
          >
            <header className={css(styles.header)}>
              <figure className={css(styles.figure)}>
                <i className={`${modal.current.type}-icon`} />
              </figure>
              {modal.current.title}
            </header>
            {modal.current.content && (
              <section className={css(styles.content)}>
                {modal.current.content}
              </section>
            )}
            <footer className={css(styles.footer)}>
              <ButtonComponent className={css(styles.button)} onClick={onClickCancel}>
                {modal.current.cancelText}
              </ButtonComponent>
              <ButtonComponent
                type="primary"
                className={css(styles.button)}
                onClick={onClickOk}
              >
                {modal.current.okText}
              </ButtonComponent>
            </footer>
          </section>

          {/* 背景 */}
          <section
            onClick={() => setIsShow(false)}
            className={css(styles.overlay)}
          />
        </>
      )}
    </>
  );
};

export const useModal = () => React.useContext(ModalContext);

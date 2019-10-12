import usePortal from "react-useportal";

export const useModal = (props) => {
  const { isOpen, togglePortal, openPortal, closePortal, Portal } = usePortal({
    onOpen(args) {
      const { portal } = args;
      portal.current.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        z-index: 100;
      `;
      if (props.onOpen) props.onOpen(args);
      /*
        Could also use the CSS below if for some reason the above doesn't work
        position: absolute;
	      top:0;
	      bottom: 0;
	      left: 0;
	      right: 0;
	      margin: auto;
       */
    },
    ...props.config
  });

  return {
    Modal: Portal,
    toggleModal: togglePortal,
    openModal: openPortal,
    closeModal: closePortal,
    isOpen
  };
};

export default useModal;

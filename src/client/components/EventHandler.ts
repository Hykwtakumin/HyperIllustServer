export const handleDown = () => {};

export const handleMove = () => {};

export const handleUp = () => {};

export const handleCancel = () => {};

export const eventHandler = (event: React.SyntheticEvent) => {
  event.persist();
  if (event.type === "pointerdown") {
    console.log("pointerdown");
  } else if (event.type === "pointermove") {
  } else if (event.type === "pointerup") {
    console.log("pointerup");
  } else if (event.type === "pointercancel") {
  }
};

import * as React from "react";
import { StyleSheet, css } from "aphrodite/no-important";
import cx from "classnames";

// ______________________________________________________
//
// @ Types
//
type Props = {
  className?: string;
  onClick?: (ev: React.MouseEvent<HTMLElement>) => void;
  type?: ButtonType;
  htmlType?: "submit" | "button" | "reset";
  disabled?: boolean;
  elevate?: boolean;
  style?: React.CSSProperties;
};

type ButtonType =
  | "primary"
  | "default"
  | "dashed"
  | "danger"
  | "green"
  | "orange";

// ______________________________________________________
//
// @ View
//
export const ButtonComponent: React.FC<Props> = props => {
  const params = React.useCallback(() => {
    if (props.disabled) {
      return {
        bgcNormal: "#f5f5f5",
        bgcHover: "#f5f5f5",
        bgcActive: "#f5f5f5",
        bdrNormal: "#d9d9d9",
        bdrHover: "#d9d9d9",
        txtNormal: "rgba(0, 0, 0, 0.25)",
        txtHover: "rgba(0, 0, 0, 0.25)"
      };
    }
    switch (props.type) {
      case "primary":
        return {
          bgcNormal: "#1890ff",
          bgcHover: "#40a9ff",
          bgcActive: "#69c0ff",
          bdrNormal: "1px solid transparent",
          bdrHover: "1px solid transparent",
          txtNormal: "#fff",
          txtHover: "#fff"
        };
      case "dashed":
        return {
          bgcNormal: "#fff",
          bgcHover: "#fafafa",
          bgcActive: "#d9d9d9",
          bdrNormal: "1px dashed lightgrey",
          bdrHover: "1px dashed #1890ff",
          txtNormal: "rgba(0,0,0,.65)",
          txtHover: "#1890ff"
        };
      case "danger":
        return {
          bgcNormal: "#f5222d",
          bgcHover: "#ff4d4f",
          bgcActive: "#ff7875",
          bdrNormal: "1px solid lightgrey",
          bdrHover: "1px solid transparent",
          txtNormal: "#fff",
          txtHover: "#fff"
        };
      case "green":
        return {
          bgcNormal: "rgba(103,150,148,1)",
          bgcHover: "rgba(103,150,148,0.8)",
          bgcActive: "rgba(103,150,148,0.6)",
          bdrNormal: "1px solid transparent",
          bdrHover: "1px solid transparent",
          txtNormal: "#fff",
          txtHover: "#fff"
        };
      case "orange":
        return {
          bgcNormal: "rgba(255,141,60,1)",
          bgcHover: "rgba(255,141,60,0.8)",
          bgcActive: "rgba(255,141,60,0.6)",
          bdrNormal: "1px solid transparent",
          bdrHover: "1px solid transparent",
          txtNormal: "#fff",
          txtHover: "#fff"
        };
      default:
        return {
          bgcNormal: "#fff",
          bgcHover: "#fafafa",
          bgcActive: "#d9d9d9",
          bdrNormal: "1px solid lightgrey",
          bdrHover: "1px solid #1890ff",
          txtNormal: "rgba(0,0,0,.65)",
          txtHover: "#1890ff"
        };
    }
  }, [props.type, props.disabled]);

  const styles = StyleSheet.create({
    button: {
      border: params().bdrNormal,
      borderRadius: "5px",
      padding: "12px 18px",
      fontSize: "16px",
      cursor: props.disabled ? "not-allowed" : "pointer",
      color: params().txtNormal,
      backgroundColor: params().bgcNormal,
      boxShadow: props.elevate ? "0 0 4px #999" : "0",
      outline: "none",
      userSelect: "none"
    },
    ripple: {
      backgroundPosition: "center",
      transition: "all 0.8s",
      ":hover": {
        background: `${
          params().bgcHover
        } radial-gradient(circle, transparent 1%, ${
          params().bgcHover
        } 1%) center/15000%`,
        border: params().bdrHover,
        color: params().txtHover
      },
      ":active": {
        backgroundColor: params().bgcActive,
        backgroundSize: "100%",
        transition: "background 0s"
      }
    }
  });

  return (
    <button
      type={props.htmlType}
      disabled={props.disabled}
      className={cx(props.className, css(styles.button), css(styles.ripple))}
      onClick={props.onClick}
      style={props.style}
    >
      {props.children}
    </button>
  );
};

ButtonComponent.defaultProps = {
  type: "default",
  htmlType: "button",
  disabled: false,
  elevate: false
};

import React from 'react';
import "../App.css";

export interface IButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    backgroundColor?: string;
    color?: string;
};

export const TestButton: React.FunctionComponent<IButtonProps> = props => {
    const { children, backgroundColor, color, style } = props;

    let _style: React.CSSProperties = style || {};

    /** Overrides default */
    if (backgroundColor) _style.backgroundColor = backgroundColor;
    if (color) _style.color = color;

    return (
        <button className="/" style={_style} {...props}>
            {children}
        </button>
    );
};


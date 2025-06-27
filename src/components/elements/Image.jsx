import React from "react";

const Image = (props) => {
    const { src, alt = '', width = '', height = '', className = '', style = {} } = props;
    return (
        <img
            {...(src ? { src } : {})}
            {...(alt ? { alt } : {})}
            {...(width ? { width } : {})}
            {...(height ? { height } : {})}
            {...(className ? { className } : {})}
            {...(style ? { style } : {})}
            {...props}
        />
    );
}

export default Image;
import React from 'react';

const Image = ({
    src,
    alt = '',
    width = 600,
    height = 400,
    className = '',
    style = {},
    ...props
}) => {
    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            {...props}
        />
    );
};

export default Image;
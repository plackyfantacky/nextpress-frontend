import React from 'react';

const A = (props) => {
    const { href = '#', className = '', id = '', rel = '', target = '_self', children = {} } = props;
    return (
        <a
            href={href} // Default to '#' if no href is provided
            {...(id ? { id } : {})}
            {...(rel ? { rel } : {})}
            {...(target ? { target } : {})}
            {...(className ? { className } : {})}
            {...props}>
            {children}
        </a>
    );
};

export default A;
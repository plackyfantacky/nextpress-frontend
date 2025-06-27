import React from 'react';

const Cite = ({ className = '', id = '', children, ...props }) => {

    return (
        <cite
            {...(className ? { className } : {})}
            {...(id ? { id } : {})}
            {...props}>
            {children}
        </cite>
    );
};

export default Cite;
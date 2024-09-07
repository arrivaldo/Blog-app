import React from 'react';

export default function Image({src, ...rest}) {
    src = src && src.includes('https://')  // Remove the space between 'https:' and '//'
    ? src
    : 'http://localhost:4000/' + src;

    return (
        <img {...rest} src={src} alt={''} />
    );
}

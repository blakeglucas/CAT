import React from 'react'

export function useHeaderHeight() {

    const [height, setHeight] = React.useState(0)

    React.useEffect(() => {
        const navs = document.getElementsByTagName('nav')
        const header = navs[0]
        console.log(header.getBoundingClientRect()?.height)
        if (!header) {
            setHeight(0)
        } else {
            setHeight(header.getBoundingClientRect()?.height || 0)
        }
    }, [])

    return height
}
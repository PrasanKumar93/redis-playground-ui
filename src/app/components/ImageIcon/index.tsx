import "./index.scss";

import Image from "next/image";

interface IImageIconProps {
    imgSrc: string;
    alt: string;
    imgWidth?: number | string;
    imgHeight?: number | string;
}

const ImageIcon = ({ imgSrc, alt, imgWidth = "1rem", imgHeight = "1rem" }: IImageIconProps) => {
    return <div className="comp-image-icon" style={{ width: imgWidth, height: imgHeight }} >
        <Image src={imgSrc} alt={alt} fill />
    </div>
}

export default ImageIcon;
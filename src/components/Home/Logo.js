import React from 'react';

const Logo = ({bgColor, width, height, widthV, heightV}) => {
    return (
        <svg width={width} height={height} viewBox={`0 0 ${widthV} ${heightV}`} fill="none" xmlns="http://www.w3.org/2000/svg">

<path d="M49.4431 27.5375C49.1604 24.392 47.9024 21.9471 45.6691 20.2028C43.4641 18.4298 40.3121 17.5434 36.213 17.5434C33.4992 17.5434 31.2376 17.9008 29.4284 18.6157C27.6191 19.3306 26.2622 20.3172 25.3576 21.5754C24.453 22.805 23.9865 24.2204 23.9583 25.8218C23.9017 27.1372 24.1561 28.2953 24.7215 29.2962C25.3152 30.297 26.1633 31.1835 27.2658 31.9556C28.3966 32.699 29.7535 33.3567 31.3366 33.9286C32.9196 34.5006 34.7006 35.001 36.6795 35.4299L44.1426 37.1456C48.4395 38.0893 52.2276 39.3475 55.5068 40.9203C58.8144 42.493 61.5848 44.366 63.818 46.5393C66.0796 48.7126 67.7899 51.2147 68.9489 54.0456C70.108 56.8766 70.7016 60.0507 70.7299 63.568C70.7016 69.1155 69.3164 73.8766 66.5743 77.8514C63.8322 81.8262 59.8886 84.8716 54.7436 86.9877C49.6268 89.1038 43.45 90.1618 36.213 90.1618C28.9478 90.1618 22.6155 89.0609 17.216 86.859C11.8166 84.6572 7.61859 81.3115 4.62204 76.822C1.62549 72.3325 0.0848079 66.6563 0 59.7933H20.0995C20.2691 62.6243 21.0183 64.9834 22.3469 66.8707C23.6756 68.7581 25.4989 70.1878 27.817 71.1601C30.1634 72.1323 32.8772 72.6184 35.9586 72.6184C38.7855 72.6184 41.1884 72.2324 43.1673 71.4603C45.1744 70.6883 46.7151 69.6159 47.7893 68.2433C48.8636 66.8707 49.4148 65.298 49.4431 63.5251C49.4148 61.8665 48.906 60.451 47.9165 59.2786C46.9271 58.0776 45.4006 57.0482 43.3369 56.1903C41.3015 55.3038 38.7007 54.4889 35.5346 53.7454L26.4601 51.6007C18.9405 49.8564 13.018 47.0397 8.69282 43.1507C4.36761 39.2331 2.21914 33.9429 2.24741 27.2802C2.21914 21.847 3.66088 17.0859 6.57262 12.9967C9.48436 8.90752 13.5127 5.71912 18.6578 3.43147C23.8028 1.14382 29.6687 0 36.2554 0C42.9835 0 48.8212 1.15812 53.7683 3.47436C58.7437 5.76201 62.6024 8.97901 65.3446 13.1254C68.0867 17.2717 69.486 22.0758 69.5426 27.5375H49.4431Z" fill={bgColor}/>
<path d="M111.735 90.2905C104.865 90.2905 98.971 88.8607 94.0521 86.0012C89.1615 83.1416 85.4017 79.1668 82.7726 74.0768C80.1436 68.9582 78.829 63.0389 78.829 56.319C78.829 49.5704 80.1436 43.6511 82.7726 38.5611C85.4299 33.4425 89.2039 29.4534 94.0945 26.5939C99.0134 23.7343 104.879 22.3045 111.692 22.3045C117.714 22.3045 122.957 23.4055 127.424 25.6073C131.919 27.8092 135.424 30.9261 137.94 34.9581C140.484 38.9615 141.827 43.6654 141.969 49.07H122.59C122.194 45.6957 121.063 43.0506 119.198 41.1347C117.36 39.2188 114.957 38.2609 111.989 38.2609C109.586 38.2609 107.48 38.9472 105.671 40.3198C103.862 41.6637 102.448 43.6654 101.43 46.3248C100.441 48.9556 99.9462 52.2155 99.9462 56.1045C99.9462 59.9935 100.441 63.282 101.43 65.97C102.448 68.6294 103.862 70.6453 105.671 72.0179C107.48 73.3619 109.586 74.0339 111.989 74.0339C113.911 74.0339 115.607 73.6193 117.077 72.79C118.576 71.9608 119.805 70.7454 120.767 69.1441C121.728 67.5141 122.336 65.541 122.59 63.2248H141.969C141.771 68.658 140.428 73.4048 137.94 77.4654C135.481 81.526 132.018 84.6858 127.551 86.9448C123.113 89.1753 117.841 90.2905 111.735 90.2905Z" fill={bgColor}/>
<path d="M170.941 90.1618C166.786 90.1618 163.096 89.4612 159.874 88.0601C156.679 86.6303 154.149 84.4856 152.283 81.6261C150.446 78.7379 149.527 75.1206 149.527 70.774C149.527 67.1138 150.163 64.0255 151.435 61.5091C152.707 58.9927 154.46 56.9481 156.693 55.3753C158.927 53.8026 161.499 52.6159 164.411 51.8152C167.323 50.9859 170.432 50.4283 173.74 50.1423C177.443 49.7992 180.426 49.4417 182.687 49.07C184.949 48.6697 186.588 48.112 187.606 47.3972C188.652 46.6537 189.175 45.6099 189.175 44.2659V44.0515C189.175 41.8496 188.426 40.1482 186.927 38.9472C185.429 37.7462 183.408 37.1456 180.864 37.1456C178.122 37.1456 175.917 37.7462 174.249 38.9472C172.581 40.1482 171.521 41.8067 171.068 43.9228L151.944 43.2365C152.51 39.2331 153.965 35.6587 156.312 32.5132C158.686 29.3391 161.937 26.8512 166.065 25.0497C170.22 23.2196 175.21 22.3045 181.033 22.3045C185.189 22.3045 189.019 22.805 192.525 23.8058C196.03 24.7781 199.083 26.2078 201.684 28.0951C204.285 29.9539 206.292 32.2415 207.705 34.9581C209.147 37.6747 209.868 40.7773 209.868 44.2659L209.359 90.2905H189.853L190.362 79.8674H189.853C188.694 82.0979 187.21 83.9852 185.401 85.5294C183.62 87.0735 181.514 88.2316 179.083 89.0037C176.68 89.7758 173.966 90.1618 170.941 90.1618ZM177.344 76.436C179.577 76.436 181.585 75.9784 183.366 75.0634C185.175 74.1483 186.616 72.8901 187.691 71.2888C188.765 69.6588 189.302 67.7715 189.302 65.6268V59.3644C188.708 59.679 187.988 59.9649 187.139 60.2223C186.32 60.4796 185.415 60.7227 184.426 60.9515C183.436 61.1802 182.419 61.3804 181.373 61.552C180.327 61.7235 179.323 61.8808 178.362 62.0238C176.411 62.3383 174.743 62.8245 173.358 63.4822C172.001 64.1399 170.955 64.9977 170.22 66.0558C169.514 67.0852 169.16 68.3148 169.16 69.7446C169.16 71.9179 169.923 73.5764 171.45 74.7202C173.005 75.8641 174.97 76.436 177.344 76.436Z" fill={bgColor}/>
<path d="M243.282 51.472V89.0466H222.547V23.1624H242.265V35.2583H242.986C244.427 31.2264 246.887 28.0666 250.364 25.7789C253.841 23.4627 257.982 22.3045 262.788 22.3045C267.368 22.3045 271.34 23.3483 274.704 25.4358C278.096 27.4946 280.725 30.3828 282.591 34.1002C284.485 37.789 285.418 42.107 285.39 47.054V90.1618H264.654V51.1718C264.682 47.5115 263.764 44.652 261.898 42.5931C260.06 40.5342 257.502 39.5048 254.223 39.5048C252.046 39.5048 250.124 39.9909 248.456 40.9632C246.816 41.9068 245.544 43.2651 244.639 45.038C243.763 46.8109 243.311 48.9556 243.282 51.472Z" fill={bgColor}/>
<path d="M314.002 130H291.443L323.755 1.20101H351.699L381 89.0466H358.441L338.045 23.334H337.366L314.002 130ZM314.002 54.4746H361.155V70.6025H314.002V54.4746Z" fill={bgColor}/>
</svg>

    );
}

export default Logo;
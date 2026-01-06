// components/LottiePlayerWrapper.js
import dynamic from 'next/dynamic';

const LottiePlayer = dynamic(
    async () => {
        const { Player } = await import('@lottiefiles/react-lottie-player');
        return Player;
    },
    { ssr: false } // Disable server-side rendering for this component
);

export default LottiePlayer;
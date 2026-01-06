// 'use client';

// import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

// const ToggleButton = () => {
//   const { RiveComponent, rive } = useRive({
//     src: '/rive/button1.riv', // Path to your Rive file
//     stateMachines: 'State Machine 1', // Name of your state machine
//     autoplay: true,
//     autoBind: true,
//   });

// //   const onPressInput = useStateMachineInput(rive, 'Light/Dark Mode Button', 'Toggle_Is_Pressed');

// //   const handleMouseEnter = () => {
// //     if (onPressInput) {
// //       onPressInput.value ? (onPressInput.value = false) : (onPressInput.value = true);
// //     }
// //   };

// //   const handleMouseLeave = () => {
// //     if (onPressInput) {
// //       onPressInput.value = false;
// //     }
// //   };

//   return (
//     // <div onClick={handleMouseEnter}>
//       <RiveComponent />
//     // </div>
//   );
// };

// export default ToggleButton;
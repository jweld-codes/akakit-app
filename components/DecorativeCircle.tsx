import { View } from 'react-native';

interface DecorativeCircleProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'custom';
  width?: number;
  height?: number;
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
  color: string;
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
}

export const DecorativeCircle = ({ 
  position = 'bottom-left', 
  width = 150,
  height = 150,
  bottom,
  left,
  right,
  top,
  color,
  opacity = 0.3,
  borderWidth,
  borderColor
}: DecorativeCircleProps) => {
  
  const getPosition = () => {
    // Si se proporcionan valores personalizados, úsalos directamente
    if (position === 'custom' || bottom !== undefined || left !== undefined || right !== undefined || top !== undefined) {
      return {
        ...(bottom !== undefined && { bottom }),
        ...(left !== undefined && { left }),
        ...(right !== undefined && { right }),
        ...(top !== undefined && { top })
      };
    }
    
    // Si no, usa las posiciones predefinidas
    const offset = -width / 3;
    switch(position) {
      case 'bottom-left':
        return { bottom: offset, left: offset };
      case 'bottom-right':
        return { bottom: offset, right: offset };
      case 'top-left':
        return { top: offset, left: offset };
      case 'top-right':
        return { top: offset, right: offset };
      default:
        return { bottom: offset, left: offset };
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        ...getPosition(),
        width: width,
        height: height,
        borderRadius: width / 2,
        backgroundColor: color,
        opacity: opacity,
        ...(borderWidth && { borderWidth }),
        ...(borderColor && { borderColor })
      }}
    />
  );
};
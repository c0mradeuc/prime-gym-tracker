import React from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

type WebDndProps = {
  draggable?: boolean;
  onDragStart?: (e: any) => void;
  onDragOver?: (e: any) => void;
  onDragEnter?: (e: any) => void;
  onDragLeave?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onDrop?: (e: any) => void;
};

type Props = ViewProps &
  WebDndProps & {
    children?: React.ReactNode;
    style?: ViewStyle | ViewStyle[] | (ViewStyle | false | undefined)[];
  };

/**
 * On web: renders a real <div> so HTML5 drag-and-drop attributes
 * (draggable + onDrag* handlers) work natively. RN-Web's <View>
 * does not forward these attributes.
 *
 * On native: renders a normal <View>; HTML5 DnD props are ignored.
 */
export const DragCard: React.FC<Props> = ({ children, style, ...rest }) => {
  if (Platform.OS === 'web') {
    const flat = StyleSheet.flatten(style as any) || {};
    const {
      draggable,
      onDragStart,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDragEnd,
      onDrop,
      ...other
    } = rest;
    // Mimic React Native View's default layout so flex children behave the same
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    };
    return React.createElement(
      'div',
      {
        style: { ...baseStyle, ...(flat as React.CSSProperties) },
        draggable,
        onDragStart,
        onDragOver,
        onDragEnter,
        onDragLeave,
        onDragEnd,
        onDrop,
        ...other,
      },
      children,
    );
  }
  return (
    <View style={style as any} {...(rest as ViewProps)}>
      {children}
    </View>
  );
};

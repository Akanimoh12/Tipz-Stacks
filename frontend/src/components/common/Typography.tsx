import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

interface HeadingProps extends TypographyProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface TextProps extends TypographyProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent';
  align?: 'left' | 'center' | 'right';
  as?: 'p' | 'span' | 'div';
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  as,
  children,
  className = '',
}) => {
  const Tag = (as || `h${level}`) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const sizeClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl',
    2: 'text-3xl md:text-4xl lg:text-5xl',
    3: 'text-2xl md:text-3xl lg:text-4xl',
    4: 'text-xl md:text-2xl',
    5: 'text-lg md:text-xl',
    6: 'text-base md:text-lg',
  };

  return (
    <Tag className={`font-heading font-bold ${sizeClasses[level]} ${className}`}>
      {children}
    </Tag>
  );
};

export const Paragraph: React.FC<TextProps> = ({
  children,
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  as = 'p',
  className = '',
}) => {
  const Tag = as;
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    accent: 'text-accent',
  };
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Tag
      className={`leading-relaxed ${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${alignClasses[align]} ${className}`}
    >
      {children}
    </Tag>
  );
};

export const Label: React.FC<TextProps> = ({
  children,
  weight = 'medium',
  className = '',
}) => {
  return (
    <label className={`text-sm font-${weight} text-text-primary ${className}`}>
      {children}
    </label>
  );
};

export const Caption: React.FC<TextProps> = ({
  children,
  color = 'secondary',
  className = '',
}) => {
  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    accent: 'text-accent',
  };

  return (
    <span className={`text-xs ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};

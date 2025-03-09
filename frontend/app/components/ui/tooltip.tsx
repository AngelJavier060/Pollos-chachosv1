import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          className="bg-black text-white px-2 py-1 rounded text-sm"
          sideOffset={5}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-black" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

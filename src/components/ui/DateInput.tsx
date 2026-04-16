import React, { useRef, forwardRef } from 'react';
import { useDateFormat } from '../../hooks/useDateFormat';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
    value?: string | null;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const { formatToGB, formatToYYYYMMDD } = useDateFormat();
        const containerRef = useRef<HTMLDivElement>(null);

        // Use formatting hooks
        const displayValue = formatToGB(value);
        const dateValue = formatToYYYYMMDD(value);

        // Call the browser's native date picker securely
        const handleClick = () => {
            const input = containerRef.current?.querySelector('input[type="date"]') as HTMLInputElement;
            if (input && 'showPicker' in input) {
                try {
                    input.showPicker();
                } catch (err) {
                    console.warn('showPicker API fallback', err);
                }
            }
        };

        return (
            <div ref={containerRef} className="relative w-full" onClick={handleClick}>
                {/* Visually shown text input that preserves formatting */}
                <input
                    {...props}
                    type="text"
                    value={displayValue}
                    readOnly
                    className={`${className || ''} cursor-pointer caret-transparent`}
                    placeholder="DD/MM/YYYY"
                />
                {/* The hidden native date logic */}
                <input
                    ref={ref}
                    type="date"
                    value={dateValue}
                    onChange={onChange}
                    name={props.name} // Ensures form binding keeps working
                    className="absolute left-0 bottom-0 w-0 h-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                />
            </div>
        );
    }
);

export default DateInput;

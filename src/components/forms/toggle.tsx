import { Switch } from '@headlessui/react';
import React, { useState } from 'react';
import { twJoin } from 'tailwind-merge';

interface ToggleProps {
	label: string;
	description: string;
	value: boolean;
	onChange: (value: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = (props) => {
	return (
		<Switch.Group as="div" className="flex items-center justify-between">
			<span className="flex flex-grow flex-col">
				<Switch.Label as="span" className="text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-300" passive>
					{props.label}
				</Switch.Label>
				<Switch.Description as="span" className="text-sm text-zinc-500 dark:text-zinc-400">
					{props.description}
				</Switch.Description>
			</span>
			<Switch
				checked={props.value}
				onChange={props.onChange}
				className={twJoin(
					props.value ? 'bg-brand-600 dark:bg-brand-700' : 'bg-zinc-200 dark:bg-zinc-900',
					'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
				)}
			>
				<span
					aria-hidden="true"
					className={twJoin(
						props.value ? 'translate-x-5' : 'translate-x-0',
						'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-zinc-300',
					)}
				/>
			</Switch>
		</Switch.Group>
	);
};

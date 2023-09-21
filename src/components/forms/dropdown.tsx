import React, { Fragment, useCallback, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { twJoin } from 'tailwind-merge';

type Option = {
	id: number | string;
	title: string;
};

interface DropdownProps<DropdownOption extends Option = Option> {
	options: DropdownOption[];
	value: DropdownOption | null;
	onSelect?: (option: DropdownOption) => void;
	label: string;
}

export const Dropdown = <DropdownOption extends Option = Option>(props: DropdownProps<DropdownOption>) => {
	const { onSelect, value } = props;

	const onSelected = useCallback(
		(newSelection: DropdownOption) => {
			onSelect?.(newSelection);
		},
		[onSelect],
	);

	const options = props.options.slice(0).sort((a, b) => a.title.localeCompare(b.title));

	return (
		<Listbox value={value} onChange={onSelected}>
			{({ open }) => (
				<>
					<Listbox.Label className="block text-sm font-semibold leading-6 text-zinc-700 dark:text-zinc-300">
						{props.label}
					</Listbox.Label>
					<div className="relative mt-1">
						<Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-600 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 sm:text-sm sm:leading-6">
							<span className="block truncate">{value?.title ?? 'Pick from the list...'}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 text-zinc-400" aria-hidden="true" />
							</span>
						</Listbox.Button>

						<Transition
							show={open}
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-400 scrollbar-thumb-rounded-md focus:outline-none dark:bg-zinc-900 dark:scrollbar-thumb-zinc-600 sm:text-sm">
								{options.length === 0 && (
									<div className="px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500">No options available</div>
								)}
								{options.map((option) => (
									<Listbox.Option
										key={option.id}
										className={({ active }) =>
											twJoin(
												active ? 'bg-brand-600 text-white' : 'text-zinc-900 dark:text-zinc-300',
												'relative cursor-default select-none py-2 pl-3 pr-9',
											)
										}
										value={option}
									>
										{({ selected, active }) => (
											<>
												<span className={twJoin(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
													{option.title}
												</span>

												{selected ? (
													<span
														className={twJoin(
															active ? 'text-white' : 'text-brand-600',
															'absolute inset-y-0 right-0 flex items-center pr-4',
														)}
													>
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</>
			)}
		</Listbox>
	);
};

'use client'

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'

interface SelectOption {
  id: number | string
  name: string
  avatar?: string
}

interface CustomSelectProps {
  options: SelectOption[]
  value: SelectOption
  onChange: (val: SelectOption) => void
  label?: string
  getOptionClass?: (option: SelectOption) => string // 👈 custom per-option style
  getButtonClass?: (value: SelectOption) => string // 👈 custom selected button style
}

export default function CustomSelect({
  options,
  value,
  onChange,
  label,
  getOptionClass,
  getButtonClass,
}: CustomSelectProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-900">{label}</label>}
      <div className="relative mt-1">
        <Listbox value={value} onChange={onChange}>
          <ListboxButton
            className={`grid w-full cursor-default grid-cols-1 rounded-md py-2 pr-2 pl-3 text-left outline-1 -outline-offset-1 focus-visible:outline-2 focus-visible:-outline-offset-2 sm:text-sm
              ${getButtonClass ? getButtonClass(value) : 'bg-white text-gray-900 outline-gray-300 focus-visible:outline-indigo-600'}
            `}
          >
            <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
              {value.avatar && (
                <img
                  alt=""
                  src={value.avatar}
                  className="w-5 h-5 shrink-0 rounded-full bg-gray-100"
                />
              )}
              <span className="block truncate">{value.name}</span>
            </span>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="col-start-1 row-start-1 w-5 h-5 self-center justify-self-end text-gray-500 sm:w-4 sm:h-4"
            />
          </ListboxButton>

          <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 sm:text-sm">
            {options.map((option) => (
              <ListboxOption
                key={option.id}
                value={option}
                className={`group relative cursor-default py-2 pr-9 pl-3 select-none 
                  text-gray-900 data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden
                  ${getOptionClass ? getOptionClass(option) : ''}
                `}
              >
                <div className="flex items-center">
                  {option.avatar && (
                    <img
                      alt=""
                      src={option.avatar}
                      className="w-5 h-5 shrink-0 rounded-full"
                    />
                  )}
                  <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">
                    {option.name}
                  </span>
                </div>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                  <CheckIcon aria-hidden="true" className="w-5 h-5" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>
      </div>
    </div>
  )
}

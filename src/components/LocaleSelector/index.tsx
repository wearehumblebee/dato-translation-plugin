
import {
  Dropdown,
  DropdownOption,
  DropdownMenu,
  CaretUpIcon,
  CaretDownIcon,
  Button,
} from 'datocms-react-ui';

type PropTypes = {
  locales: string[];
  changeLocale:Function
  label:string;
  keyPrefix?:string;
  selectedLocale:string;
};

export default function LocaleSelector({ locales, changeLocale, label, keyPrefix, selectedLocale }: PropTypes) {
  const prefix = keyPrefix || "locale-option";
  return (
    <Dropdown
    renderTrigger={({ open, onClick }) => (
      <Button
        onClick={onClick}
        rightIcon={open ? <CaretUpIcon /> : <CaretDownIcon />}
      >
        {label}
        </Button>
    )}
  >
    <DropdownMenu>
      {locales.map((locale) => {
        return (
          <DropdownOption key={`${prefix}-${locale}`} active={locale === selectedLocale} onClick={() => changeLocale(locale)}>{locale}</DropdownOption>
        )
      })}
    </DropdownMenu>
  </Dropdown>

  );
}

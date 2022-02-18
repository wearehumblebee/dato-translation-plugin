
import LocaleSelector from '../LocaleSelector';
import s from './styles.module.css';

type PropTypes = {
  sourceLocale: string;
  targetLocale?:string;
  locales:string[];
  changeSourceLocale:Function;
  selectedSourceLocale:string;
};

export default function Locales({ sourceLocale, targetLocale, locales, changeSourceLocale, selectedSourceLocale }: PropTypes) {

  return (
    <div className={s['langSettings']}>
      <div>
        <LocaleSelector locales={locales} changeLocale={changeSourceLocale} label="Select source language" selectedLocale={selectedSourceLocale}/>
      </div>
      <div>
        <div>
          Source language: <strong>{sourceLocale}</strong>
        </div>
        {targetLocale && (
          <div>
            Target language: <strong>{targetLocale}</strong>
          </div>
        )}
      </div>

  </div>

  );
}

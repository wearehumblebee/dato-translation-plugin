
import s from './styles.module.css';
import { Button } from "datocms-react-ui";

type PropTypes = {
  isDisabled: boolean;
  uploadFile:Function;
  label: string
};

export default function FileUpload({ isDisabled, uploadFile, label }: PropTypes) {
  return (
   <div className={s['uploadWrapper']}>
    <Button>{label}</Button>
    <input
      name="upload"
      id="upload"
      accept=".json"
      type="file"
      disabled={isDisabled}
      onChange={(e) => uploadFile(e)}
    />
</div>

  );
}

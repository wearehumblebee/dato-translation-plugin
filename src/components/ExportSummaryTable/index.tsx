import s from './styles.module.css';
import { Button } from "datocms-react-ui";
import { ExportSummary } from "../../types/export";

type PropTypes = {
  summary: ExportSummary;
  onDownloadClick: Function
};

export default function ExportSummaryTable({ summary, onDownloadClick }: PropTypes) {

  const downloadSummary = () => {
    onDownloadClick(summary.file);
  }

  return (
    <div className={s['tableWrapper']}>
      <table className={s['layoutTable']}>
        <thead>
          <tr>
            <th/>
            <th>Success</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Exported records</td>
            <td>{summary.recordsCount}</td>
          </tr>
          <tr>
            <td>Exported assets</td>
            <td>{summary.assetsCount}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
            <Button buttonType='primary'
              buttonSize="s"
              onClick={downloadSummary}>Download export file</Button>
            </td>
            <td>{summary.recordsCount + summary.assetsCount}</td>

          </tr>
        </tfoot>
        <tfoot>

        </tfoot>
      </table>

    </div>

  );
}

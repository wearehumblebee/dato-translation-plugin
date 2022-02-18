import { LogSummary } from "../../types/logger";
import s from './styles.module.css';
import { Button } from "datocms-react-ui";

type PropTypes = {
  summary: LogSummary
  onDownloadClick: Function
};

export default function SummaryTable({ summary,onDownloadClick }: PropTypes) {

  const downloadSummary = () => {
    onDownloadClick(summary, "import-log");
  }

  const getTotalSuccess = () => {
    return summary.create.ok + summary.update.ok + summary.updateAsset.ok;
  }

  const getTotalErrors = () => {
    return summary.create.error + summary.update.error + summary.updateAsset.error;
  }

  return (
    <div className={s['tableWrapper']}>
      <table className={s['layoutTable']}>
        <thead>
          <tr>
            <th/>
            <th>Success</th>
            <th>Failure</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Created records</td>
            <td>{summary.create.ok}</td>
            <td>{summary.create.error}</td>
          </tr>
          <tr>
            <td>Updated records</td>
            <td>{summary.update.ok}</td>
            <td>{summary.update.error}</td>
          </tr>
          <tr>
            <td>Updated assets</td>
            <td>{summary.updateAsset.ok}</td>
            <td>{summary.updateAsset.error}</td>
          </tr>
          <tr>
            <td>Warnings</td>
            <td>x</td>
            <td>{summary.warnings.length}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
            <Button buttonType='primary'
              buttonSize="s"
              onClick={downloadSummary}>Download detailed summary</Button>
            </td>
            <td>{getTotalSuccess()}</td>
            <td>{getTotalErrors()}</td>
          </tr>
        </tfoot>
        <tfoot>

        </tfoot>
      </table>

    </div>

  );
}

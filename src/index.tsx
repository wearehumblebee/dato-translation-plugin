import { connect } from 'datocms-plugin-sdk';
import { render } from './utils/render';
import 'datocms-react-ui/styles.css';
import Export from "./entrypoints/Export"
import Import from "./entrypoints/Import"

connect({
  mainNavigationTabs(ctx) {
    return [
      {
        label: 'Export',
        icon: 'file-export',
        pointsTo: {
          pageId: 'export',
        },
        placement: ["before", "settings"]
      },
      {
        label: 'Import',
        icon: 'file-import',
        pointsTo: {
          pageId: 'import',
        },
        placement: ["before", "settings"]
      },
    ];
  },
  renderPage(pageId, ctx) {
    if(pageId === "export"){
      return render(<Export ctx={ctx}/>);
    }else{
      return render(<Import ctx={ctx}/>);
    }

  },
});

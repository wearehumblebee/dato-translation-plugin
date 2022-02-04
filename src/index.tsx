import { connect } from 'datocms-plugin-sdk';
import { render } from './utils/render';
import 'datocms-react-ui/styles.css';
import Export from "./entrypoints/Export"

connect({
  mainNavigationTabs(ctx) {
    return [
      {
        label: 'Export',
        icon: 'calendar',
        pointsTo: {
          pageId: 'export',
        },
        placement: ["before", "settings"]
      },
    ];
  },
  renderPage(pageId, ctx) {
    // TODO switch by pageId for import
    return render(<Export ctx={ctx}/>);
  },
});

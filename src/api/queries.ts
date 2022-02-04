/**
   * @desc Fetch all records in from Dato instance. Records is content
   * @param client SiteClient from "datocms-client" package
   * @param {boolean} fetchOnlyPublished Fetch only published records or latest changes
   */
 export const fetchRecords = async (client:any, onlyPublished:boolean):Promise<Record<string,unknown>[]> => {

  const params = {
    version: onlyPublished ? 'published' : 'latest',
  };

  // TODO CHECK THIS GUY OUT.....
  //     nested  string  Optional
  // For Modular Content fields and Structured Text fields, return full payload for nested blocks instead of IDs

  return client.items.all({ ...params }, { allPages: true });

};

export const fetchAssets = async (client:any):Promise<Record<string,unknown>[]> => {
  // we could filter on asset type here if we want, fetching all for now
  const filter = {
    //"filter[type]": "image",
  };

  return client.uploads.all(filter, { allPages: true });

};

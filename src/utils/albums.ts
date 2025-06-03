export async function getAlbumImages(albumId: string) {
  let images = import.meta.glob<{ default: ImageMetadata }>(
    "/src/content/albums/**/*.{jpeg,jpg,png}"
  );

  // Filter and extract filenames
  const imageEntries = Object.entries(images)
    .filter(([key]) => key.includes(albumId))
    .map(([path]) => {
      // Extract filename from path
      const filename = path.split('/').pop() || '';
      return {
        contentPath: path,
        publicPath: `/assets/albums/${albumId}/${filename}`,
        filename: filename
      };
    });

  return imageEntries;
}
export async function getAlbumImages(albumId: string) {
  const images = import.meta.glob<{ default: string }>(
    "/public/assets/albums/**/*.{jpeg,jpg,png,webp}",
    { eager: true }
  );

  return Object.entries(images)
    .filter(([path]) => path.includes(albumId))
    .map(([path, image]) => {
      const filename = path.split("/").pop() || "";
      return {
        publicPath: path.replace("/public", ""),
        filename: filename,

        src: image.default,
      };
    });
}

import { imageVariants, srcsetFor } from "../../lib/image-variants";
import { normalizeTinaRepoMediaSrc } from "../../lib/tina-media";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Required: root-relative src (e.g. /images/foo.jpg). Falls back to <img> if no variants exist. */
  src: string;
  /** Optional: sizes attribute used when variants exist. */
  sizes?: string;
};

export default function ResponsiveImage({
  src,
  sizes,
  ...imgProps
}: Props) {
  // Tina can provide absolute CDN URLs for newly uploaded media. In visual editing,
  // rewriting those to repo paths can break preview before a deploy publishes the asset.
  const normalizedSrc = /^https?:\/\//i.test(src) ? src : normalizeTinaRepoMediaSrc(src);
  const vars = imageVariants(normalizedSrc);
  if (!vars) return <img src={normalizedSrc} {...imgProps} />;

  const s = sizes ?? "100vw";
  return (
    <picture style={{ display: "contents" }}>
      {vars.avif.length ? (
        <source type="image/avif" srcSet={srcsetFor(vars.avif)} sizes={s} />
      ) : null}
      {vars.webp.length ? (
        <source type="image/webp" srcSet={srcsetFor(vars.webp)} sizes={s} />
      ) : null}
      <img src={normalizedSrc} {...imgProps} />
    </picture>
  );
}


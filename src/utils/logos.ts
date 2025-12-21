import type { LogoKey } from "../state/AppStore";

export function getLogoSource(key?: LogoKey) {
  switch (key) {
    case "nvt":
      return require("../../assets/logos/brand/nvt.png");

    case "spartan":
      return require("../../assets/logos/teams/spartan.png");
    case "lanham":
      return require("../../assets/logos/teams/lanham.png");
    case "elite":
      return require("../../assets/logos/teams/elite.png");
    case "balisao":
      return require("../../assets/logos/teams/balisao.png");
    case "nova":
      return require("../../assets/logos/teams/nova.png");
    case "delaware-progressives":
      return require("../../assets/logos/teams/delaware-progressives.png");
    case "vfc":
      return require("../../assets/logos/teams/vfc.png");
    case "social-boyz":
      return require("../../assets/logos/teams/social-boyz.png");
    case "bvfc":
      return require("../../assets/logos/teams/bvfc.png");
    case "zoo-zoo":
      return require("../../assets/logos/teams/zoo-zoo.png");
    case "nevt":
      return require("../../assets/logos/teams/nevt.png");
    case "delaware-vets":
      return require("../../assets/logos/teams/delaware-vets.png");
    case "nj-ndamba":
      return require("../../assets/logos/teams/nj-ndamba.png");
    case "landover":
      return require("../../assets/logos/teams/landover.png");

    default:
      // fallback to NVT brand logo (you DO have it)
      return require("../../assets/logos/brand/nvt.png");
  }
}

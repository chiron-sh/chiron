import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { Icons } from "@/components/icons";
import { createElement } from "react";

export const source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	icon(icon) {
		const customIcon = Icons[icon as keyof typeof Icons];
		if (customIcon) return createElement(customIcon);

		if (icon && icon in icons)
			return createElement(icons[icon as keyof typeof icons]);
	},
});

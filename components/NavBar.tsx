"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@components/components/ui/accordion";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { Grid2X2Icon, HomeIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function NavBar() {
    const { myCategories, fetchCategories } = useCategoriesStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <aside className="w-64 max-h-(100vh-65px) p-container flex flex-col">
            <p className="text-lg font-semibold">사이드바</p>
            <Link href={"/"} className="flex gap-2 items-center py-4 justify-start rounded-button w-full">
                <HomeIcon size={18} />
                홈
            </Link>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base">
                        <div className="flex gap-2 items-center">
                            <Grid2X2Icon size={18} />
                            게시물
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {myCategories.map((category) => (
                            <button key={category.id} className="flex gap-2 py-4 items-center rounded-button w-full">
                                {category.name}
                            </button>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Link href={"/settings"} className="flex gap-2 py-4 items-center rounded-button w-full">
                <SettingsIcon size={18} />
                설정
            </Link>
        </aside>
    );
}

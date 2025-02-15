"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@components/components/ui/accordion";
import { Grid2X2Icon } from "lucide-react";

export default function NavBar() {
    return (
        <aside className="w-64 max-h-(100vh-65px) p-container">
            <p className="text-lg font-semibold">사이드바 메뉴</p>
            <li className="p-2 cursor-pointer">홈</li>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base">
                        <div className="flex gap-2 items-center">
                            <Grid2X2Icon size={18} />
                            게시물
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <li className="p-2 rounded hover:bg-gray-700 cursor-pointer">설정</li>
        </aside>
    );
}

import React, { ReactElement, useEffect, useState } from "react";

import { useLocation } from "@docusaurus/router";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import { SearchButton } from "./SearchButton";
import SearchModal from "../SearchModal";

import { Mark } from "../../utils/proxiedGenerated";

const SEARCH_PARAM_HIGHLIGHT = "_highlight";

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement;
  const tagName = element.tagName;

  return (
    element.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  );
}

export default function SearchBar(): ReactElement {
  const location = useLocation();
  const {
    siteConfig: { baseUrl },
  } = useDocusaurusContext();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!Mark) {
      return;
    }
    const keywords = ExecutionEnvironment.canUseDOM
      ? new URLSearchParams(location.search).getAll(SEARCH_PARAM_HIGHLIGHT)
      : [];
    if (keywords.length === 0) {
      return;
    }
    const root = document.querySelector("article");
    if (!root) {
      return;
    }
    const mark = new Mark(root);
    mark.unmark();
    mark.mark(keywords);
  }, [location.search]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.keyCode === 27 && isOpen) ||
        // The `Cmd+K` shortcut both opens and closes the modal.
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        // The `/` shortcut opens but doesn't close the modal because it's
        // a character.
        (!isEditingContent(event) && event.key === "/" && !isOpen)
      ) {
        event.preventDefault();

        if (isOpen) {
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <SearchButton
        onClick={() => {
          setIsOpen(true);
        }}
      />

      {isOpen ? <SearchModal onClose={() => setIsOpen(false)} /> : ""}
    </>
  );
}
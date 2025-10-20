import { useEffect } from "react";

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  useEffect(() => {
    const baseTitle = "SkillSync";
    document.title = title ? `${title} - ${baseTitle}` : baseTitle;
  }, [title]);

  return null;
};

export default PageTitle;
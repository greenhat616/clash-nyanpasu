import { isEmpty } from "lodash-es";
import { memo } from "react";
import { VList } from "virtua";
import { classNames } from "@/utils";
import { RamenDining, Terminal } from "@mui/icons-material";
import { Divider } from "@mui/material";
import { useClash } from "@nyanpasu/interface";
import { filterProfiles } from "../utils";

const LogListItem = memo(function LogListItem({
  name,
  item,
  showDivider,
}: {
  name?: string;
  item?: [string, string];
  showDivider?: boolean;
}) {
  return (
    <>
      {showDivider && <Divider />}

      <div className="w-full break-all font-mono">
        <span className="text-red-500">[{name}]: </span>
        <span>{item}</span>
      </div>
    </>
  );
});

export interface SideLogProps {
  className?: string;
}

export const SideLog = ({ className }: SideLogProps) => {
  const { getRuntimeLogs, getProfiles } = useClash();

  const { scripts } = filterProfiles(getProfiles.data?.items);

  return (
    <div className={classNames("w-full", className)}>
      <div className="flex items-center justify-between p-2 pl-4">
        <div className="flex items-center gap-2">
          <Terminal />

          <span>Console</span>
        </div>
      </div>

      <Divider />

      <VList className="flex select-text flex-col gap-2 overflow-auto p-2">
        {!isEmpty(getRuntimeLogs.data) ? (
          Object.entries(getRuntimeLogs.data).map(([uid, content]) => {
            return content.map((item, index) => {
              const name = scripts?.find((script) => script.uid === uid)?.name;

              return (
                <LogListItem
                  key={uid + index}
                  name={name}
                  item={item}
                  showDivider={index !== 0}
                />
              );
            });
          })
        ) : (
          <div className="flex h-full min-h-48 w-full flex-col items-center justify-center">
            <RamenDining className="!size-10" />
            <p>No Log</p>
          </div>
        )}
      </VList>
    </div>
  );
};

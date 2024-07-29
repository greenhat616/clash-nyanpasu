import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useClash, useNyanpasu } from "@nyanpasu/interface";
import { BaseCard, BaseDialog, Expand } from "@nyanpasu/ui";
import { ClashWebItem, extractServer, openWebUrl, renderChip } from "./modules";

export const SettingClashWeb = () => {
  const { t } = useTranslation();

  const { nyanpasuConfig, setNyanpasuConfig } = useNyanpasu();

  const { getClashInfo } = useClash();

  const labels = useMemo(() => {
    const { host, port } = extractServer(getClashInfo.data?.server);

    return {
      host,
      port,
      secret: getClashInfo.data?.secret,
    };
  }, [getClashInfo.data, getClashInfo.data?.server]);

  const [open, setOpen] = useState(false);

  const [editString, setEditString] = useState("");

  const [editIndex, setEditIndex] = useState<number | null>(null);

  const deleteItem = (index: number) => {
    setNyanpasuConfig({
      web_ui_list: nyanpasuConfig?.web_ui_list
        ?.slice(0, index)
        .concat(nyanpasuConfig?.web_ui_list?.slice(index + 1)),
    });
  };

  const updateItem = () => {
    const list = nyanpasuConfig?.web_ui_list || [];

    if (!list) return;

    if (editIndex !== null) {
      list[editIndex] = editString;
    } else {
      list.push(editString);
    }

    setNyanpasuConfig({ web_ui_list: list });
  };

  return (
    <>
      <BaseCard
        label={t("Web UI")}
        labelChildren={
          <Tooltip title="New Item">
            <IconButton
              onClick={() => {
                setEditString("");
                setEditIndex(null);
                setOpen(true);
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Grid container sx={{ mt: 1 }} spacing={2}>
          {nyanpasuConfig?.web_ui_list?.map((item, index) => {
            return (
              <Grid key={index} xs={12} xl={6}>
                <ClashWebItem
                  label={renderChip(item, labels)}
                  onOpen={() => openWebUrl(item, labels)}
                  onEdit={() => {
                    setEditIndex(index);
                    setEditString(item);
                    setOpen(true);
                  }}
                  onDelete={() => deleteItem(index)}
                />
              </Grid>
            );
          })}
        </Grid>
      </BaseCard>

      <BaseDialog
        title={editIndex != null ? "Edit Item" : "New Item"}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditIndex(null);
        }}
        onOk={() => {
          updateItem();
          setOpen(false);
          setEditIndex(null);
          setEditString("");
        }}
        ok="Submit"
        close="Close"
        contentSx={{ overflow: editString ? "auto" : "hidden" }}
        divider
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h5">Input</Typography>

          <TextField
            sx={{ width: "100%" }}
            value={editString}
            variant="outlined"
            multiline
            placeholder={`Support %host %port %secret`}
            onChange={(e) => setEditString(e.target.value)}
          />

          <Typography sx={{ userSelect: "text" }}>
            Replace host, port, secret with:
          </Typography>

          <Box display="flex" gap={1}>
            {Object.entries(labels).map(([key], index) => {
              return <Chip key={index} size="small" label={`%${key}`} />;
            })}
          </Box>

          <Expand open={Boolean(editString) || false}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Divider sx={{ mt: 1, mb: 1 }} />

              <Typography variant="h5">Result</Typography>

              <Typography sx={{ userSelect: "text" }} component="div">
                {renderChip(editString, labels)}
              </Typography>
            </Box>
          </Expand>
        </Box>
      </BaseDialog>
    </>
  );
};

export default SettingClashWeb;

export interface NotificationType {
  title: string;
  message: string;
  type: "warning" | "info" | "error" | "success" | "question"
}

export class NotificationManager {
  private notificationsRoot: HTMLDivElement;
  constructor(private root: HTMLElement) {
    this.notificationsRoot = document.createElement("div");
    this.notificationsRoot.style.position = "absolute";
    this.notificationsRoot.style.bottom = "0";
    this.notificationsRoot.style.right = "0";
    this.notificationsRoot.style.height = "100%";
    this.notificationsRoot.style.display = "flex";
    this.notificationsRoot.style.flexDirection = "column-reverse";
    this.notificationsRoot.style.gap = "5px";
    this.notificationsRoot.style.zIndex = "1000";
    this.notificationsRoot.style.alignItems = "flex-end";

    root.appendChild(this.notificationsRoot);
  }

  public async notify(notification: NotificationType): Promise<void | boolean> {
    const tab = document.createElement("div");
    tab.id = notification.title;
    tab.style.display = "flex";
    tab.style.flexDirection = "column";
    tab.style.gap = "3px";
    tab.style.background = "var(--surfaceColor)";
    tab.style.border = "solid 1px var(--borderColor)";
    tab.style.borderRadius = "8px";
    tab.style.padding = "5px";

    const closeTab = () => {
      tab.remove();
      return;
    }

    const closeWithReturn = (toReturn: boolean) => {
      tab.remove();
      return toReturn;
    }

    const titleDiv = document.createElement("div");
    titleDiv.id = "notification-title-div";
    titleDiv.style.borderBottom = "solid 1px var(--borderColor)";
    titleDiv.style.display = "flex";
    titleDiv.style.alignItems = "center";
    titleDiv.style.justifyContent = "center";
    titleDiv.style.gap = "5px";

    const title = document.createElement("span");
    title.id = "notification-title";
    title.innerText = notification.title;
    title.style.color = "var(--fontColor)";

    const icon = document.createElement("img");
    icon.style.width = "15px";
    icon.style.height = "15px";

    switch (notification.type) {
      case "info":
      case "question": {
        icon.src = await window.nq.getIcon("info", false);
        break;
      }
        
      case "error": {
        icon.src = await window.nq.getIcon("error", false);
        break;
      }

      case "success": {
        icon.src = await window.nq.getIcon("success", false);
        break;
      }

      case "warning": {
        icon.src = await window.nq.getIcon("warning", false);
        break;
      }
    }

    const closeBtn = document.createElement("img");
    closeBtn.style.width = "10px";
    closeBtn.style.height = "10px";
    closeBtn.src = await window.nq.getIcon("cross", false);
    closeBtn.style.cursor = "pointer";

    closeBtn.onclick = () => {
      closeTab();
    }

    titleDiv.appendChild(icon);
    titleDiv.appendChild(title);
    titleDiv.appendChild(closeBtn);

    const content = document.createElement("span");
    content.id = "notification-content";
    content.innerText = notification.message;
    content.style.color = "var(--fontColor)";

    const options = document.createElement("div");
    options.id = "notification-options";
    options.style.display = "flex";
    options.style.gap = "5px";
    options.style.justifyContent = "center";
    options.style.alignItems = "center";

    switch (notification.type) {
      case "error":
      case "info":
      case "success":
      case "warning": {
        const okBtn = document.createElement("button");
        okBtn.innerText = "Ok.";
        okBtn.style.background = "var(--onSurfaceColor)";
        okBtn.style.color = "var(--fontColor)";
        okBtn.style.border = "none";
        okBtn.style.borderRadius = "6px";
        okBtn.addEventListener("click", closeTab);

        options.appendChild(okBtn)
        break;
      }
      case "question": {
        const okBtn = document.createElement("button");
        okBtn.innerText = "Ok.";
        okBtn.style.background = "var(--onSurfaceColor)";
        okBtn.style.color = "var(--fontColor)";
        okBtn.style.border = "none";
        okBtn.style.borderRadius = "6px";
        okBtn.addEventListener("click", () => closeWithReturn(true));

        const noBtn = document.createElement("button");
        noBtn.innerText = "No.";
        noBtn.style.background = "var(--onSurfaceColor)";
        noBtn.style.color = "var(--fontColor)";
        noBtn.style.border = "none";
        noBtn.style.borderRadius = "6px";
        noBtn.addEventListener("click", () => closeWithReturn(false));
        
        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "Cancel.";
        cancelBtn.style.background = "var(--onSurfaceColor)";
        cancelBtn.style.color = "var(--fontColor)";
        cancelBtn.style.border = "none";
        cancelBtn.style.borderRadius = "6px";
        cancelBtn.addEventListener("click", () => closeWithReturn(false));

        options.appendChild(okBtn);
        options.appendChild(noBtn);
        options.appendChild(cancelBtn);
        break;
      }
    }

    tab.appendChild(titleDiv);
    tab.appendChild(content);
    tab.appendChild(options);

    this.notificationsRoot.appendChild(tab);
  }
}
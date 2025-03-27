import { useTranslation } from "react-i18next";
import "./Table.modules.css";

const Table = () => {
  const { t } = useTranslation();

  return (
    <div className="table-page">
      <div className="table-content">
        <main className="main-content">
          <h2>{t("Table")}</h2>
          <div className="table-wrapper">
            <hr className="divider" />
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("ID")}</th>
                    <th>{t("Name")}</th>
                    <th>{t("Address")}</th>
                    <th>{t("Date")}</th>
                    <th>{t("Type")}</th>
                    <th>{t("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>00001</td>
                    <td>Christine Brooks</td>
                    <td>089 Kutch Green Apt. 448</td>
                    <td>14 Feb 2019</td>
                    <td>Electric</td>
                    <td className="status-cell">
                      <span className="status status-completed">
                        {t("Completed")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>00002</td>
                    <td>Rosie Pearson</td>
                    <td>979 Immanuel Ferry Suite 526</td>
                    <td>14 Feb 2019</td>
                    <td>Book</td>
                    <td className="status-cell">
                      <span className="status status-processing">
                        {t("Processing")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>00003</td>
                    <td>Darrell Caldwell</td>
                    <td>8587 Frida Ports</td>
                    <td>14 Feb 2019</td>
                    <td>Medicine</td>
                    <td className="status-cell">
                      <span className="status status-rejected">
                        {t("Rejected")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>00004</td>
                    <td>Gilbert Johnston</td>
                    <td>768 Destiny Lake Suite 600</td>
                    <td>14 Feb 2019</td>
                    <td>Mobile</td>
                    <td className="status-cell">
                      <span className="status status-completed">
                        {t("Completed")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>00005</td>
                    <td>Alan Cain</td>
                    <td>042 Mylene Throughway</td>
                    <td>14 Feb 2019</td>
                    <td>Watch</td>
                    <td className="status-cell">
                      <span className="status status-processing">
                        {t("Processing")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>00006</td>
                    <td>Alfred Murray</td>
                    <td>543 Weimann Mountain</td>
                    <td>14 Feb 2019</td>
                    <td>Medicine</td>
                    <td className="status-cell">
                      <span className="status status-completed">
                        {t("Completed")}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <hr className="divider" />
              <table className="product-table">
                <thead>
                  <tr>
                    <th>{t("Image")}</th>
                    <th>{t("Product Name")}</th>
                    <th>{t("Category")}</th>
                    <th>{t("Price")}</th>
                    <th>{t("Pieces")}</th>
                    <th>{t("Available Color")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <img
                        src="https://avatars.githubusercontent.com/u/82161648?s=40&v=4"
                        alt="Product"
                        style={{ width: "40px", height: "40px" }}
                      />
                    </td>
                    <td>Apple MacBook Pro</td>
                    <td>Electronics</td>
                    <td>$1999</td>
                    <td>5</td>
                    <td>
                      <span className="color black"></span>
                      <span className="color grey"></span>
                      <span className="color red"></span>
                      <span className="color pink"></span>
                      <span className="color yellow"></span>
                      <span className="color blue"></span>
                    </td>
                    <td>
                      <button className="edit-button">{t("Edit")}</button>
                      <button className="delete-button">{t("Delete")}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Table;

/**
 * TODO               Tabletizer is a simple js module to help
 * TODO    devs to build tables very fast with pagination, search and crud options.
 *
 * ! 1-         The ajax Data needs to be an object with two params
 **                                      Response example:
 **                       [
 **                           { totalRows:x, totalRowsThisPage:x }
 **                           [
 **                              { id:1, name: "asd"},
 **                              { id:1, name: "asd"}
 **                           ]
 **                       ]
 **
 *
 *  Parei na paginação...
 **/

class tabletizer {
	constructor(data) {
		this.data = data;
		// console.log("Generated");
	}
	data = {};
	page = 0;
	perPage = 5;
	search = "";
	async generate() {
		// console.log("Genrating table...", data);
		if (this.data.ajax && this.data.ajax["url"]) {
			let result = await ajaxSearch({
				page: this.page,
				search: this.search,
				perPage
			},
				this.data
			);
			let table = handleResult(
				result[1],
				this.data,
				this.data.config["container"]
			);

			//** -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-. */
			//*  Insert Fields with ids inside -> this.data.config["container"]
			// *
			//!        search_field_tableClientes           ->     Search field
			//!          Table_div_tableClientes            ->     Table div
			//!      Table_div_pagination_tableClientes     ->     Pagination div
			//** -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-. */

			if (!$("#" + this.data.config["container"]).html()) {
				$("#" + this.data.config["container"]).html(
					createTablePaginationAndSearchDivs({
						search: this.data.config.search.active,
						pagination: this.data.config.pagination
					},
						this.data.config.container, {
						placeholder: this.data.config.search.placeholder
					}
					)
				);
			}

			//! Calcula número de paginas necessárias para a paginação
			let numeroPaginasPagination = calculatePagesNumberToShowResults(
				result[0].totalRows,
				perPage
			);

			//* Insert Table inside div
			$("#Table_div_" + this.data.config["container"]).html(table);

			//* Insert Pagination inside div pagination
			$("#Table_div_pagination_" + this.data.config["container"]).html(
				generatePagination(
					result[0],
					this.page,
					this.perPage,
					this.data.config["container"],
					numeroPaginasPagination
				)
			);

			if (result[0].totalRows == 0) {
				$("#Table_div_" + this.data.config["container"]).hide();
				$("#Table_div_pagination_" + this.data.config["container"]).hide();
				$("#Table_div_not_found_" + this.data.config["container"]).show();
			} else {
				$("#Table_div_" + this.data.config["container"]).show();
				$("#Table_div_pagination_" + this.data.config["container"]).show();
				$("#Table_div_not_found_" + this.data.config["container"]).hide();
			}

			//! This function will show or hide some fields of pagination
			paginationNextPreviousFirstAndLastValidators(
				this.data.config["container"],
				this.page,
				numeroPaginasPagination
			);
		}
	}
}

function paginationNextPreviousFirstAndLastValidators(
	container,
	page,
	numeroPaginasPagination
) {
	if (page == 0) {
		$("#_" + container + "_pagination_before").attr("disabled", true);
	} else {
		$("#_" + container + "_pagination_before").attr("disabled", false);
	}
}

function generatePagination(data, page, perPage, id, numeroPaginasPagination) {
	let pgs = "";
	let lateralLimit = 2;
	let min = page - lateralLimit;
	let max = parseInt(page) + lateralLimit + 1;

	for (var i = min; i <= max; i++) {
		if (i >= 1 && i <= numeroPaginasPagination) {
			if (page == i - 1) {
				pgs +=
					'<li class="page-item active" style="cursor: pointer" ><a class="page-link" onclick="(' +
					i +
					')">' +
					i +
					"</a></li>";
			} else {
				pgs +=
					'<li class="page-item" style="cursor: pointer" ><a class="page-link" onclick="changePaginationPage(' +
					(i - 1) +
					", " +
					id +
					')">' +
					i +
					"</a></li>";
			}
		}
	}

	let paginationInfo =
		`
  <div class="row" style="">
    <div class="col-6">
      Quantidade de registros: <b id="_` +
		id +
		`_pagination_qnt_reg">` +
		data.totalRows +
		`</b>
    </div>    
    <div class="col-6 text-right">
      Página <b id="_` +
		id +
		`_pagination_Inicio">` +
		(page + 1) +
		`</b> de <b id="_` +
		id +
		`_pagination_Fim">` +
		numeroPaginasPagination +
		`</b>
    </div>
  </div>
  `;

	let before = page - 1;
	if (page == 0) {
		before = 0;
	}

	let next = page + 1;
	if (page + 1 == numeroPaginasPagination) {
		next = page;
	}

	let pagination =
		`
  <!-- Pagination ` +
		id +
		` -->
  <nav aria-label="Page navigation example" id="_` +
		id +
		`_pagination">
    <ul class="pagination justify-content-center">
      <li class="page-item disabled" id="_` +
		id +
		`"
    onclick="changePaginationPage(` +
		0 +
		", " +
		id +
		`)"
      >
        <a class="page-link">Primeiro</a>
      </li>
      <li class="page-item disabled" id="_` +
		id +
		`_pagination_before" onclick="changePaginationPage(` +
		before +
		", " +
		id +
		`)">
        <a class="page-link" tabindex="-1"><</a>
      </li>
      <ul id="` +
		id +
		`_ListProductsPaginationContent" class="pagination">
        ` +
		pgs +
		`
      </ul>        
      <li class="page-item disabled" id="_` +
		id +
		`_pagination_next" onclick="changePaginationPage(` +
		next +
		", " +
		id +
		`)">
        <a class="page-link" tabindex="-1">></a>
      </li>
      <li class="page-item disabled" id="_` +
		id +
		`_pagination_last"  onclick="changePaginationPage(` +
		(numeroPaginasPagination - 1) +
		", " +
		id +
		`)">
        <a class="page-link">Último</a>
      </li>
    </ul>
  </nav>
  <!-- !Pagination ` +
		id +
		` -->
  `;

	return paginationInfo + pagination;
}

function calculatePagesNumberToShowResults(totalRows, perPage) {
	if (totalRows / perPage > Math.round(totalRows / perPage)) {
		var listar_p_np = Math.round(totalRows / perPage) + 1;
	} else {
		var listar_p_np = Math.round(totalRows / perPage);
	}
	return listar_p_np;
}

function changePaginationPage(v1, v2) {
	testTb.page = v1;
	testTb.generate();
}

function searchInTable(data) {
	let search = $("#search_field_" + data.id).val();
	testTb.page = 0;
	testTb.search = search;
	testTb.generate();
}
//! <-- configs and functions that can have some errors alone.

var tabletizerOption = null;

function ajaxSearch(params, data) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: data.ajax["url"],
			method: "GET",
			data: params
		}).done(
			result => {
				resolve(result);
			}
		);
	});
}

function selectCliente(id) {
	newVendaDataParams["cliente_id"] = id;
	changePage("vendas");
	toastr.success("Cliente selecionado.");
}

function selectClienteUpdate(id) {
	atualizaVendaDataParams["cliente_id"] = id;
	changePage("vendas");
	toastr.success("Cliente selecionado para modificar venda.");
}

function removeCliente() {
	console.log("remove", deleteClienteId);
	$.ajax({
		url: "cliente/delete",
		method: "GET",
		data: {
			_id: deleteClienteId
		}
	}).done(result => {
		if (result && result.error) {
			toastr.info(result.error);
			clientesStartJs();
		} else {
			toastr.success("Cliente removido com sucesso.");
			clientesStartJs();
		}
		$("#modal_confirm_remove_cliente").modal("hide");
		console.log(result);
	});
	return false;
}

function salvaCliente() {
	$.ajax({
		url: "cliente/create",
		method: "GET",
		data: {
			nome_cliente: $("#nome_cli_create").val(),
			info_adc: $("#end_cli_create").val()
		}
	}).done(result => {
		if (result && result.error) {
			toastr.info(result.error);
			clientesStartJs();
		} else {
			toastr.success("Cliente criado com sucesso.");
			clientesStartJs();
		}
		$("#modal_add_cliente").modal("hide");
		console.log(result);
	});
	return false;
}

function atualizaCliente() {
	console.log(
		modifyClienteId,
		$("#end_cli_update").val(),
		$("#nome_cli_update").val()
	);
	$.ajax({
		url: "cliente/update",
		method: "GET",
		data: {
			id: modifyClienteId,
			info_adc: $("#end_cli_update").val(),
			nome_cliente: $("#nome_cli_update").val(),
			user_id: userCredentials['userid']
		}
	}).done(result => {
		if (result && result.error) {
			toastr.info(result.error);
			clientesStartJs();
		} else {
			toastr.success("Cliente atualizado com sucesso.");
			clientesStartJs();
		}
		$("#modal_confirm_remove_cliente").modal("hide");
		console.log(result);
	});
	return false;
}

function actionsTabletizer(id, option, e, tb) {
	if (e && e["target"] && e["target"]["cellIndex"]) {
		if (isProdutoFromUpdateInstedNewVenda) {
			console.log("From update Venda - tabletizer");
			//! Change later default function to select Handler
			selectClienteUpdate(id);
			//! Muda Variável do input Cliente Select pra venda
			$.ajax({
				url: "cliente",
				method: "GET",
				data: {
					id: id
				}
			}).done(rst => {
				console.log(rst.nome_cliente);
				if (rst && rst.nome_cliente) {
					$("#selectClienteIdUpdate__").val(
						rst.id + " - " + rst.nome_cliente
					);
				}
			});
		} else {
			console.log("From new Venda");
			//! Change later default function to select Handler
			selectCliente(id);
			//! Muda Variável do input Cliente Select pra venda
			$.ajax({
				url: "cliente",
				method: "GET",
				data: {
					id: id
				}
			}).done(rst => {
				console.log(rst.nome_cliente);
				if (rst && rst.nome_cliente) {
					$("#selectClienteId__").val(rst.id + " - " + rst.nome_cliente);
				}
			});
		}
	} else {
		if (tabletizerOption == "remove" && e) {
			//! Remove Cliente -> show modal
			$("#modal_confirm_remove_cliente").modal("show");
			deleteClienteId = id;
		} else if (tabletizerOption == "edit" && e) {
			//! Modify cliente -> show modal
			$.ajax({
				url: "cliente",
				method: "GET",
				data: {
					id: id
				}
			}).done(rst => {
				if (rst && rst.nome_cliente) {
					$("#nome_cli_update").val("");
					$("#end_cli_update").val("");
					$("#nome_cli_update").val(rst.nome_cliente);
					$("#end_cli_update").val(rst.info_adc);
				}
			});
			$("#modal_update_cliente").modal("show");
			modifyClienteId = id;
		}
	}
}

function handleResult(result, data, id) {
	tableData = result;
	isOnclickActive = data.config["onClickActive"];
	let tbody = "";
	let thead = "";

	// Handle tbody data
	tableData.forEach(row => {
		let tr = "";
		data["fields"].forEach(field => {
			rowTitle = field[0];
			rowIndex = field[1];
			tr += createTdForTable(row[rowIndex]);
		});
		if (
			data.config.crud &&
			data.config.crud.update &&
			!data.config.crud.remove
		) {
			//! Configure here the action
			tr += createTdForTable(
				"<button class='btn btn-info btn-sm'><span class='fa fa-edit'></span></button>"
			);
		} else if (
			data.config.crud &&
			data.config.crud.remove &&
			!data.config.crud.update
		) {
			tr += createTdForTable(
				//! Configure here the action
				"<button class='btn btn-danger btn-sm'><span class='fa fa-trash'></span></button>"
			);
		} else if (
			data.config.crud &&
			data.config.crud.remove &&
			data.config.crud.update
		) {
			tr += createTdForTable(
				"<button class='btn btn-info btn-sm' onclick='tabletizerOption = `edit`;actionsTabletizer(" +
				row.id +
				"," +
				id +
				")'><span class='fa fa-edit'></span></button>" +
				"<button class='btn btn-danger btn-sm' onclick='tabletizerOption = `remove`;actionsTabletizer(" +
				row.id +
				"," +
				id +
				")'><span class='fa fa-trash'></span></button>",
				"right"
			);
		}
		tbody += createTrForTable(tr, row, id, isOnclickActive);
	});
	// Handle thead data
	data["fields"].forEach(field => {
		rowTitle = field[0];
		thead += createTdForTable(rowTitle);
	});
	thead = thead;
	return tableTag(theadTag(thead) + tbodyTag(tbody), {});
}

/* ! Later implements table classes*/

function tableTag(table, classes) {
	return "<table class='table table-sm'>" + table + "</table>";
}

function theadTag(thead) {
	return "<thead>" + thead + "</thead>";
}

function tbodyTag(tbody) {
	return "<tbody>" + tbody + "</tbody>";
}

function createTdForTable(rowValue, align) {
	if (align) {
		return "<td class='text-" + align + "'>" + rowValue + "</td>";
	}
	return "<td>" + rowValue + "</td>";
}

function createTrForTable(rowValue, id, actionOnClick) {
	if (actionOnClick) {
		return (
			"<tr style='cursor:pointer' onmouseover='this.style.backgroundColor=`#ffff99`;'  onmouseout='this.style.backgroundColor=`white`;' onclick=actionsTabletizer(" +
			id.id +
			",'onclick',event)>" +
			rowValue +
			"</tr>"
		);
	}
	return "<tr>" + rowValue + "</tr>";
}

function createTablePaginationAndSearchDivs(isActive, id, data) {
	retorno = "";
	// Search field div with id
	if (isActive.search) {
		retorno +=
			"<div class='row' id='search_div_" +
			id +
			"'><div class='col'><input class='form-control' id='search_field_" +
			id +
			"' placeholder='" +
			data.placeholder +
			"' onkeyup='searchInTable(" +
			id +
			")'></input></div></div>";
	}
	// Table div with id
	retorno += "<div id='Table_div_" + id + "'></div>";
	// Pagination field div with id
	if (isActive.pagination) {
		retorno += "<div id='Table_div_pagination_" + id + "'></div>";
	}
	retorno +=
		"<div id='Table_div_not_found_" +
		id +
		"'><h5 class='mt-3'>Nenhum resultado encontrado.</h5></div>";
	return retorno;
}
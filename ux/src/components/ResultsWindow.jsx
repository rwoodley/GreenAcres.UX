import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const ResultsWindow = ({ images, tables, queryId }) => {
  const hasContent = (images && images.length > 0) || (tables && tables.length > 0);

  if (!hasContent) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Results will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Results
      </Typography>

      {/* Charts Section */}
      {images && images.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
            {images.map((img, idx) => (
              <Paper
                key={idx}
                elevation={1}
                sx={{
                  flex: '1 1 calc(50% - 4px)',
                  minWidth: 250,
                  p: 1,
                  backgroundColor: '#fff',
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                  {img.alt}
                </Typography>
                <Box
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    }
                  }}
                  onClick={() => window.open(img.src, '_blank')}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `Chart ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </Box>
                {img.detailsLink && (
                  <Box sx={{ mt: 0.5, textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#1976d2',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        '&:hover': {
                          color: '#115293',
                        }
                      }}
                      onClick={() => window.open(img.detailsLink, '_blank')}
                    >
                      Monthly Details
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Tables Section */}
      {tables && tables.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Inputs and Assumptions
          </Typography>
          {/* Group tables by rowGroup */}
          {(() => {
            const renderTable = (table, key) => (
              <Paper
                key={key}
                elevation={1}
                sx={{ flex: table.sideBySide ? 1 : undefined, p: 1.5, backgroundColor: '#fff', overflow: 'auto' }}
              >
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {table.title}
                </Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      {table.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            borderBottom: '2px solid #1976d2',
                            padding: 4,
                            textAlign: 'left',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid #e0e0e0',
                        }}
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            style={{
                              padding: 4,
                              textAlign: j === 0 ? 'left' : 'right',
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            );

            // Group tables by rowGroup property
            const grouped = tables.reduce((acc, table, idx) => {
              const group = table.rowGroup !== undefined ? table.rowGroup : idx;
              if (!acc[group]) acc[group] = [];
              acc[group].push({ table, idx });
              return acc;
            }, {});

            return (
              <>
                {Object.keys(grouped).map(groupKey => {
                  const groupTables = grouped[groupKey];
                  const hasSideBySide = groupTables.some(({ table }) => table.sideBySide);

                  if (hasSideBySide) {
                    return (
                      <Box key={`group-${groupKey}`} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {groupTables.map(({ table, idx }) => renderTable(table, `table-${idx}`))}
                      </Box>
                    );
                  } else {
                    return groupTables.map(({ table, idx }) => (
                      <Box key={`group-${groupKey}-${idx}`} sx={{ mb: 2 }}>
                        {renderTable(table, `table-${idx}`)}
                      </Box>
                    ));
                  }
                })}
              </>
            );
          })()}
        </Box>
      )}

      {/* Query ID at bottom */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        {queryId && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontStyle: 'italic',
              fontSize: '0.8rem',
              color: '#000',
              backgroundColor: '#f9f9f9',
              p: 1,
              textAlign: 'center'
            }}
          >
            Query ID: {queryId}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResultsWindow;
